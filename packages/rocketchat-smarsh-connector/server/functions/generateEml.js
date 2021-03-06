const start = '<table style="width: 100%; border: 1px solid; border-collapse: collapse; table-layout: fixed; margin-top: 10px; font-size: 12px; word-break: break-word;"><tbody>';
const end = '</tbody></table>';
const opentr = '<tr style="border: 1px solid;">';
const closetr = '</tr>';
const open20td = '<td style="border: 1px solid; text-align: center; width: 20%;">';
const open60td = '<td style="border: 1px solid; text-align: left; width: 60%; padding: 0 5px;">';
const closetd = '</td>';

function _getLink(attachment) {
	const url = attachment.title_link.replace(/ /g, '%20');

	if (Meteor.settings.public.sandstorm || url.match(/^(https?:)?\/\//i)) {
		return url;
	} else {
		return Meteor.absoluteUrl().replace(/\/$/, '') + __meteor_runtime_config__.ROOT_URL_PATH_PREFIX + url;
	}
}

RocketChat.smarsh.generateEml = () => {
	Meteor.defer(() => {
		RocketChat.models.Rooms.find().forEach((room) => {
			const smarshHistory = RocketChat.smarsh.History.findOne({ _id: room._id });
			const query = { rid: room._id };

			if (smarshHistory) {
				query.ts = { $gt: smarshHistory.lastRan };
			}

			const date = new Date();
			const rows = [];
			const data = {
				users: [],
				msgs: 0,
				files: [],
				time: smarshHistory ? moment(date).diff(moment(smarshHistory.lastRan), 'minutes') : moment(date).diff(moment(room.ts), 'minutes'),
				room: room.name ? `#${room.name}` : `Direct Message Between: ${room.usernames.join(' & ')}`
			};

			RocketChat.models.Messages.find(query).forEach((message) => {
				rows.push(opentr);

				//The timestamp
				rows.push(open20td);
				rows.push(message.ts.toISOString());
				rows.push(closetd);

				//The sender
				rows.push(open20td);
				const sender = RocketChat.models.Users.findOne({ _id: message.u._id });
				if (data.users.indexOf(sender._id) === -1) {
					data.users.push(sender._id);
				}
				rows.push(`${sender.name} &lt;${sender.emails[0].address}&gt;`);
				rows.push(closetd);

				//The message
				rows.push(open60td);
				data.msgs++;
				if (message.t) {
					const messageType = RocketChat.MessageTypes.getType(message);
					rows.push(TAPi18n.__(messageType.message, messageType.data(message), 'en'));
				} else if (message.file) {
					data.files.push(message.file._id);
					rows.push(`${message.attachments[0].title} (${_getLink(message.attachments[0])})`);
				} else {
					rows.push(message.msg);
				}
				rows.push(closetd);

				rows.push(closetr);
			});

			if (rows.length !== 0) {
				const result = start + rows.join('') + end;

				RocketChat.smarsh.History.upsert({ _id: room._id }, {
					_id: room._id,
					lastRan: date,
					lastResult: result
				});

				RocketChat.smarsh.sendEmail({
					body: result,
					subject: `Rocket.Chat, ${data.users.length} Users, ${data.msgs} Messages, ${data.files.length} Files, ${data.time} Minutes, in ${data.room}`,
					files: data.files
				});
			}
		});
	});
};
