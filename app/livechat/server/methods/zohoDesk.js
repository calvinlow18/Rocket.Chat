import { Meteor } from 'meteor/meteor';

import { hasPermission } from '../../../authorization';
import { settings } from '../../../settings';

Meteor.methods({
	'livechat:zohoDesk'(options) {
		if (!Meteor.userId() || !hasPermission(Meteor.userId(), 'view-livechat-manager')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:addAgent' });
		}

		try {
			switch (options.action) {
				case 'initialState': {
					return {
						enabled: settings.get('Livechat_Ticket_ZohoDesk_Enabled'),
						hasToken: !!settings.get('Livechat_Ticket_ZohoDesk_Client_Id'),
					};
				}

				case 'enable': {
					return settings.updateById('Livechat_Ticket_ZohoDesk_Enabled', true);
				}

				case 'disable': {
					return settings.updateById('Livechat_Ticket_ZohoDesk_Enabled', false);
				}
			}
		} catch (e) {
			if (e.response && e.response.data && e.response.data.error) {
				if (e.response.data.error.error) {
					throw new Meteor.Error(e.response.data.error.error, e.response.data.error.message);
				}
				if (e.response.data.error.response) {
					throw new Meteor.Error('integration-error', e.response.data.error.response.error.message);
				}
				if (e.response.data.error.message) {
					throw new Meteor.Error('integration-error', e.response.data.error.message);
				}
			}
			console.error('Error contacting omni.rocket.chat:', e);
			throw new Meteor.Error('integration-error', e.error);
		}
	},
});
