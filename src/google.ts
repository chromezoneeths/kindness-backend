import { google } from 'googleapis';

export interface UserInfo {
	email: string,
	name: string;
}

export async function verify( token: string ): Promise<UserInfo | false> {
	const people = google.people( {
		version: 'v1',
		auth: token
	} );
	const user = await people.people.get( {
		resourceName: 'people/me',
		personFields: 'emailAddresses,names'
	} );
	return {
		email: user.data.emailAddresses[ 0 ].value,
		name: user.data.names[ 0 ].displayName
	};
};