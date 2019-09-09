import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import toastr from 'toastr';

import { ChatRoom, ChatTicket } from '../../../../../models';
import { t } from '../../../../../utils';
import './ticketList.html';

// var tickets = new Mongo.Collection(null);
// tickets = new Mongo.Collection('livechatTickets');

// console.log(ChatTicket.find().fetch());

Template.ticketList.helpers({
	tickets() {
		const rId = Template.currentData().roomId;
		return ChatTicket.find({ rid: rId }, { sort: { _updatedAt: -1 } }).map(function (ticket) {
			switch (ticket.ticketingSystem) {
				case 'Zoho Desk':
					ticket.backgroundColor = '#ED5B29';
					break;
				default:
					ticket.backgroundColor = '#E0E0E0';
					break;
			}
			return ticket;
		});
	},
});

Template.ticketList.onCreated(function () {

	this.tickets = new ReactiveVar([]);

	// this.autorun(() => {
	// 	this.tickets.set(ChatTicket.find({ rid: rId }, { sort: { _updatedAt: -1 } }));
	// });

});

// Template.ticketList.events({
// 	'submit form'(event, instance) {
// 		event.preventDefault();
// 		const ticketData = {};
// 		const roomData = { rid: instance.room.get()._id };

// 		var roomId = instance.room.get()._id

// 		ticketData.subject = event.currentTarget.elements.subject.value;

// 		Meteor.call('livechat:createTicket', ticketData, roomData, (err) => {
// 			if (err) {
// 				toastr.error(t(err.error));
// 			} else {
// 				toastr.success(t('Saved'));
// 			}
// 		});
// 	},

// 	'click .save'() {
// 		this.save();
// 	},

// 	'click .cancel'() {
// 		this.cancel();
// 	},
// });
