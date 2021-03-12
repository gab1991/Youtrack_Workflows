var entities = require('@jetbrains/youtrack-scripting-api/entities');
var notifications = require('@jetbrains/youtrack-scripting-api/notifications');

function emailComposer(issue, emails) {
	var subject = '[Help Desk] New Issue ' + issue.id + ' ' + issue.summary;
	var body = issue.wikify(issue.description || '');
	var link = '<a href="' + issue.url + '">' + issue.id + '</a>';
	var footer =
		'<div style="        color: #888888; background-color: #f0f0f0; padding-left: 5px; min-height: 50px display: flex; flex-direction: column; justify-content: center;">' +
		'<p style="margin: 0; padding: 0;">' +
		'This message is delivered by YouTrack Workflow. Follow the link to open up the issue ' +
		link +
		'</p>' +
		'<p style="margin: 0; padding: 0; font-size: 12px">' +
		'If you want unsubscribe than remove yourself from "Help Desk Email Receivers" group or contact Youtrack administrator' +
		'</p>' +
		'</div>';
	return {
		fromName: issue.reporter.fullName,
		toEmails: emails,
		subject: subject,
		body: body + footer,
	};
}

function formEmails(group) {
	var emails = [];
	group.users.forEach((user) => {
		emails.push(user.email);
	});
	return emails;
}

exports.rule = entities.Issue.onChange({
	title: 'Email_notify',
	guard: function (ctx) {
		return (
			ctx.issue.becomesReported && // true only on creation
			ctx.EmailReceivers.users.size // check whether there is users in this group
		);
	},
	action: function (ctx) {
		var issue = ctx.issue;

		var emails = formEmails(ctx.EmailReceivers);

		var message = emailComposer(issue, emails);

		notifications.sendEmail(message, issue);
		console.log('worked on issue' + issue.id);
	},
	requirements: {
		EmailReceivers: {
			type: entities.UserGroup,
			name: 'Help Desk Email Receivers',
		},
	},
});
