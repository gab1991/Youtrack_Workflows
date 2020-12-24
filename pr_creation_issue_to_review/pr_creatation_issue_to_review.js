var entities = require('@jetbrains/youtrack-scripting-api/entities');
var workflow = require('@jetbrains/youtrack-scripting-api/workflow');

exports.rule = entities.Issue.onChange({
	title: 'Pr_creatation_issue_to_review',

	guard: function (ctx) {
		return (
			ctx.issue.fields.State && // fixing issue.Draft error
			ctx.issue.fields.State.name === ctx.State.InProgress.name &&
			ctx.issue.pullRequests.isNotEmpty() && // ensure there is PRs
			ctx.issue.pullRequests.last().previousState === null // ensure that this is a new PR added
		);
	},

	action: function (ctx) {
		// move issue to review
		ctx.issue.fields.State = ctx.State.Review;

		workflow.message('Your task has been sent ' + ctx.State.Review.name);

		console.log('pr_createion_issue_to_review', ctx.issue.id);
	},

	requirements: {
		// Has to match states from current project
		State: {
			type: entities.EnumField.fieldType,
			Review: {
				name: 'Reviewing',
			},
			InProgress: {
				name: 'In Progress',
			},
		},
	},
});
