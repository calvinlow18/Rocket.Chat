import { Meteor } from 'meteor/meteor';

import { hasPermission } from '../../../authorization';

import { Tickets } from '../../../models';

Meteor.publish('livechat:tickets', function () {
	if (!this.userId) {
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:tickets' }));
	}

	if (!hasPermission(this.userId, 'view-l-room')) {
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:tickets' }));
	}

	const self = this;

	const handle = Tickets.find().observeChanges({
		added(id, fields) {
			self.added('tickets', id, fields);
		},
		changed(id, fields) {
			self.changed('tickets', id, fields);
		},
		removed(id) {
			self.removed('tickets', id);
		},
	});

	self.ready();

	self.onStop(function () {
		handle.stop();
	});
});
