var entities = require('@jetbrains/youtrack-scripting-api/entities');
var workflow = require('@jetbrains/youtrack-scripting-api/workflow');

exports.rule = entities.Issue.onChange({
	title: 'Pr_accepted',

	guard: function (ctx) {
		return (
			ctx.issue.fields.State && // fixing issue.Draft error
			ctx.issue.fields.State.name === ctx.State.Review.name &&
			ctx.issue.pullRequests.isNotEmpty() && // ensure there is PRs
			ctx.issue.pullRequests.last().previousState &&
			ctx.issue.pullRequests.last().state.name !== ctx.issue.pullRequests.last().previousState.name
		);
	},

	action: function (ctx) {
		var issue = ctx.issue;
		var issueStatus = issue.fields.State.name;

		var lastPR = issue.pullRequests.last();

		// Checking if PR is  MERGED and Issue is now under Review. If so, set Issue to "Testing" state
		var continueCondition = lastPR.state.name === 'MERGED' && issueStatus === ctx.State.Review.name;

		if (!continueCondition) {
			return;
		}

		// will throw an error if user tries to move task with merged pr To Review.
		workflow.check(
			!ctx.issue.fields.isChanged(ctx.State),
			'You cannot move issue with the last PR merged to Review State. You should create a new PR to do so',
		);

		//Move to testing
		issue.fields.State = ctx.State.Testing;

		// Remove rewier from the issue
		issue.fields.Assignee.clear();

		console.log('pr_accepted', issue.id);
	},

	requirements: {
		// Has to match states from current project

		State: {
			type: entities.EnumField.fieldType,
			Review: {
				name: 'Review',
			},
			Testing: {
				name: 'Testing',
			},
		},
		// In order the script to work we must provide info that this custom type exists
		Assignee: {
			type: entities.User.fieldType,
			multi: true,
		},
	},
});
