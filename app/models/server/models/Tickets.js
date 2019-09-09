import { Meteor } from 'meteor/meteor';
import _ from 'underscore';
import s from 'underscore.string';

import { Base } from './_Base';
import Settings from './Settings';

export class Tickets extends Base {
	constructor(...args) {
		super(...args);

		this.tryEnsureIndex({ name: 1 }, { unique: true, sparse: true });
		this.tryEnsureIndex({ default: 1 });
		this.tryEnsureIndex({ t: 1 });
		this.tryEnsureIndex({ 'u._id': 1 });
		this.tryEnsureIndex({ 'tokenpass.tokens.token': 1 });
		this.tryEnsureIndex({ open: 1 }, { sparse: true });
		this.tryEnsureIndex({ departmentId: 1 }, { sparse: true });
		this.tryEnsureIndex({ ts: 1 });

		// discussions
		this.tryEnsureIndex({ prid: 1 }, { sparse: true });
	}

}

export default new Tickets('ticket', true);
