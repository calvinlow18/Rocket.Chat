import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import _ from 'underscore';
import s from 'underscore.string';
import moment from 'moment';
import UAParser from 'ua-parser-js';

import { modal } from '../../../../../ui-utils';
import { ChatRoom, ChatTicket, Rooms, Subscriptions } from '../../../../../models';
import { settings } from '../../../../../settings';
import { t, handleError, roomTypes } from '../../../../../utils';
import { hasRole } from '../../../../../authorization';
import { LivechatVisitor } from '../../../collections/LivechatVisitor';
import { LivechatDepartment } from '../../../collections/LivechatDepartment';
import './ticketInfo.html';

Template.ticketInfo.helpers({
	user() {
		const user = Template.instance().user.get();
		if (user && user.userAgent) {
			const ua = new UAParser();
			ua.setUA(user.userAgent);

			user.os = `${ua.getOS().name} ${ua.getOS().version}`;
			if (['Mac OS', 'iOS'].indexOf(ua.getOS().name) !== -1) {
				user.osIcon = 'icon-apple';
			} else {
				user.osIcon = `icon-${ua.getOS().name.toLowerCase()}`;
			}
			user.browser = `${ua.getBrowser().name} ${ua.getBrowser().version}`;
			user.browserIcon = `icon-${ua.getBrowser().name.toLowerCase()}`;

			user.status = roomTypes.getUserStatus('l', this.rid) || 'offline';
		}
		return user;
	},

	room() {
		return ChatRoom.findOne({ _id: this.rid });
	},

	createDetails() {
		const instance = Template.instance();
		return {
			roomId: this.rid,
			save() {
				instance.action.set();
			},
		};
	},

	listDetails() {
		return {
			roomId: this.rid,
		};
	},

	showTicketList() {
		const instance = Template.instance();
		return instance.showTicketList.get();
	}

});

Template.ticketInfo.events({
	'click .create-ticket'(event, instance) {
		event.preventDefault();

		instance.action.set('create');
	}
});

Template.ticketInfo.onCreated(function () {
	// this.visitorId = new ReactiveVar(null);
	// this.customFields = new ReactiveVar([]);
	this.action = new ReactiveVar();
	this.showTicketList = new ReactiveVar(true);
	// this.user = new ReactiveVar();
	// this.departmentId = new ReactiveVar(null);

	// this.autorun(() => {
	// 	this.user.set(LivechatVisitor.findOne({ _id: this.visitorId.get() }));
	// });
});
