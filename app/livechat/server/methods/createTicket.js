import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

import { Messages, Rooms, LivechatVisitors } from '../../../models';
import { Livechat } from '../lib/Livechat';
import { settings } from '../../../settings';

function getZohoApiHeader() {
	const zohoDeskAuthToken = settings.get('Livechat_Ticket_ZohoDesk_Auth_Token');
	const zohoDeskOrgId = settings.get('Livechat_Ticket_ZohoDesk_Org_Id');

	if (!zohoDeskAuthToken) {
		throw new Error('Zoho Desk Auth Token not provided.');
	}

	if (!zohoDeskOrgId) {
		throw new Error('Zoho Desk Org Id not provided.');
	}

	return {
		orgId: zohoDeskOrgId,
		Authorization: `Zoho-authtoken ${zohoDeskAuthToken}`
	};
}

function zohoCreateContact(contactData) {
	const zohoApiBaseUrl = settings.get('Livechat_Ticket_ZohoDesk_Api_Base_Url');

	const headers = getZohoApiHeader();

	return new Promise((resolve, reject) => {
		HTTP.post(`${zohoApiBaseUrl}/contacts`, {
			headers: headers,
			data: contactData
		}, function (err, response) {
			if (err) {
				return reject(err);
			}
			return resolve(response);
		});
	});
}

function zohoCreateTickets(ticketData) {
	const zohoApiBaseUrl = settings.get('Livechat_Ticket_ZohoDesk_Api_Base_Url');

	const headers = getZohoApiHeader();

	return new Promise((resolve, reject) => {
		HTTP.post(`${zohoApiBaseUrl}/tickets`, {
			headers: headers,
			data: ticketData
		}, function (err, response) {
			if (err) {
				return reject(err);
			}
			return resolve(response);
		});
	});
}

function messageContentLine(content) {
	return `<p style="margin-left: 10px">${content}</p><br>`;
}

function imageAttachment(link, title) {
	return `<img style="margin: 10px" src="${link}" alt="${title}"><br>`;
}

function messageHeaderLine(ts, name) {
	return `[${ts}] ${name}<br>`
}

function massageMessages(messages = []) {
	const siteUrl = settings.get('Site_Url');
	return messages.map((message) => {
		const ts = message.ts.toISOString();
		const name = message.u.name;
		const msg = message.msg;
		const attachments = message.attachments || [];

		var fullMessage = messageHeaderLine(ts, name);

		if (msg && msg.trim().length > 0) {
			fullMessage += messageContentLine(msg);
		}

		if (attachments) {
			for (var index in attachments) {
				const attachment = attachments[index];
				if (attachment["image_url"]) {
					const title = attachment.title;
					const imageUrl = attachment['image_url'];

					const imageFullUrl = `${siteUrl}${imageUrl}`;
					fullMessage += imageAttachment(imageFullUrl, title);
				}
			}
		}

		return fullMessage;
	});
}

Meteor.methods({
	'livechat:createTicket'(ticketData, roomData) {

		const roomId = roomData.rid;
		const ticketSubject = ticketData.subject;
		const zohoDeskEnabled = settings.get('Livechat_Ticket_ZohoDesk_Enabled');

		const room = Rooms.findOneByIdOrName(roomId);
		const messages = Messages.findByRoomId(roomId).fetch();
		const messageStr = massageMessages(messages).join('');

		if (!room) {
			throw new Error(`Invalid roomId: ${roomId}`);
		}


		var promises = [];
		if (zohoDeskEnabled) {
			const zohoDeskDefaultDepartmentId = settings.get('Livechat_Ticket_ZohoDesk_Default_Department_Id');

			if (!zohoDeskDefaultDepartmentId) {
				throw new Error('Zoho Desk Default Department Id not provided.');
			}

			const v = room.v;
			const visitorToken = v.token;
			const visitor = LivechatVisitors.getVisitorByToken(visitorToken);

			const contactData = {
				"cf": {
					"visitorId": visitor['_id'],
					"visitorUsername": visitor.username,
					"visitorToken": visitor.token
				},
				"lastName": visitor.name,
				// "zip": "123902",
				// "country": "USA",
				// "city": "Texas",
				// "mobile": "+10 2328829010",
				// "description": "first priority contact",
				// "type": "paidUser",
				// "title": "The contact",
				// "firstName": "hugh",
				// "street": "North street",
				// "state": "Austin",
			};

			const visitorEmails = visitor.visitorEmails || [];
			if (visitorEmails) {
				for (i = 0; i < visitorEmails.length; i++) {
					if (i == 0) {
						contactData.email = visitorEmails[i].address;
					}
					if (i == 1) {
						contactData.secondaryEmail = visitorEmails[i].address;
					}
				}
			}

			const visitorPhones = visitor.phone || [];
			if (visitorPhones) {
				const phoneNumber = visitorPhones[0].phoneNumber;
				contactData.phone = phoneNumber;
			}

			const ticketData = {
				subject: ticketSubject,
				description: messageStr,
				departmentId: zohoDeskDefaultDepartmentId,
			};

			return new Promise((resolve, reject) => {
				zohoCreateContact(contactData)
					.then((response) => {
						const data = response.data;
						ticketData.contactId = data.id;

						return zohoCreateTickets(ticketData);
					})
					.then((response) => {
						const data = response.data;

						const ticket = Livechat.createTicket({
							roomId,
							ticketSubject,
							ticketContent: messageStr,
							ticketingSystem: 'Zoho Desk',
							webUrl: data.webUrl
						});

						resolve(ticket);
					})
					.catch((err) => {
						reject(err);
					});
			});
		}
	},
});
