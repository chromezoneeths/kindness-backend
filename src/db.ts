import * as mongo from 'mongodb';
import * as cfg from './cfg';

let client;

export async function init(): Promise<void> {
	client = new mongo.MongoClient( cfg.url, { useNewUrlParser: true, useUnifiedTopology: true } );
	await client.connect();
	const db = client.db( cfg.db );
	await Promise.all( [
		db.createCollection( 'sent', {
			validator: {
				$or: [
					{ message: { $type: 'string' } },
					{ timestamp: { $type: 'date' } },
					{ sender: { $type: 'string', $regex: /^\w*\@eths202\.org$/ } },
					{ recipient: { $type: 'string', $regex: /^\w*\@eths202\.org$/ } }
				]
			}
		} ),
		db.createCollection( 'banned', {
			validator: {
				$or: [
					{ address: { $type: 'string', $regex: /^\w*\@eths202\.org$/ } }
				]
			}
		} )
	] );
}

export interface Message {
	message: string,
	timestamp: string,
	sender: string,
	recipient: string;
}

export async function addMessage( message: string, sender: string, recipient: string ): Promise<void> {
	const db = client.db( cfg.db );
	const sent = db.collection( 'sent' );
	await sent.insertOne( {
		message,
		sender,
		recipient,
		timestamp: ( new Date( Date.now() ) ).getUTCDate()
	} );
}

export async function getMessages( user: string ): Promise<Message[]> {
	const db = client.db( cfg.db );
	const sent = db.collection( 'sent' );
	return new Promise( resolve => sent.find( { recipient: user } ).toArray( ( _: Error, d: Message[] ) => resolve( d ) ) );
}