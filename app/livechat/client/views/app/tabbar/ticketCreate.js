import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import toastr from 'toastr';

import { ChatRoom } from '../../../../../models';
import { t } from '../../../../../utils';
import './ticketCreate.html';

Template.ticketCreate.helpers({

	ticket() {
		return Template.instance().ticket.get();
	},
});

Template.ticketCreate.onCreated(function () {
	this.room = new ReactiveVar();
	this.ticket = new ReactiveVar({});

	this.autorun(() => {
		this.room.set(ChatRoom.findOne({ _id: Template.currentData().roomId }));
	});
});

Template.ticketCreate.events({
	'submit form'(event, instance) {
		event.preventDefault();
		const ticketData = {};
		const roomData = { rid: instance.room.get()._id };

		ticketData.subject = event.currentTarget.elements.subject.value;

		Meteor.call('livechat:createTicket', ticketData, roomData, (err) => {
			if (err) {
				toastr.error(t(err.error));
			} else {
				toastr.success(t('Saved'));
			}
		});
	},

	'click .save'() {
		this.save();
	},

	'click .cancel'() {
		this.cancel();
	},
});
