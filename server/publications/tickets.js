import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { normalizeMessagesForUser } from '../../app/utils/server/lib/normalizeMessagesForUser';
import { Messages, Tickets } from '../../app/models';

Meteor.methods({
	'tickets/get'() {
		return Tickets.find().fetch();
	},
});
