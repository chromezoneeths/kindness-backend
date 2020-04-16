import WebSocket from 'ws';
import * as db from './db';
import * as cfg from './cfg';
import * as google from './google';

const wss = new WebSocket.Server( { port: cfg.port } );

async function session( ws: WebSocket ): Promise<void> {
	console.log( "New client, waiting for them to send us a token..." );
	// Wait for a token
	const token = await new Promise<string>( ( resolve ) => {
		function h( data ) {
			const msg = JSON.parse( data );
			if ( msg.action === 'token' ) {
				resolve( msg.token );
			} else {
				ws.once( 'message', h );
			}
		}
		ws.once( 'message', h );
	} );
	// End waiting for a token

	const userInfo = await google.verify( token );
	// Check if the user is real
	if ( userInfo === false ) {
		ws.send( JSON.stringify( {
			action: 'token',
			status: false
		} ) );
		ws.close();
		return;
	} else {
		ws.send( JSON.stringify( {
			action: 'token',
			status: true
		} ) );
	}
	// End check if the user is real
}