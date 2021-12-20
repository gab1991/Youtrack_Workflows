var entities = require('@jetbrains/youtrack-scripting-api/entities');

exports.rule = entities.Issue.onChange({
	title: 'pr_declined_v2',

	guard: function (ctx) {
		return (
			ctx.issue.fields.State && // fixing issue.Draft error
			ctx.issue.fields.State.name === ctx.State.Review.name &&
			ctx.issue.pullRequests.isNotEmpty() && // ensure there is PRs
			!ctx.issue.fields.isChanged(ctx.State) && // allow users to change State manually, otherwise this will be blocked
			ctx.issue.pullRequests.last().previousState &&
			ctx.issue.pullRequests.last().state.name !== ctx.issue.pullRequests.last().previousState.name
		);
	},

	action: function (ctx) {
		var issue = ctx.issue;
		var issueStatus = issue.fields.State.name;

		var lastPR = issue.pullRequests.last();

		// Checking if PR is Declined and Issue is now under Review. If so, set Issue to "In Progress" state
		if (lastPR.state.name === 'DECLINED' && issueStatus === ctx.State.Review.name) {
			issue.fields.State = ctx.State.InProgress;
		}
	},

	requirements: {
		// Has to match states from current project
		State: {
			type: entities.State.fieldType,
			InProgress: {
				name: 'In Progress',
			},
			Review: {
				name: 'Review',
			},
		},
	},
});
