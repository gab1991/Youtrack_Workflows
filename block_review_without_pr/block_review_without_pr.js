var entities = require('@jetbrains/youtrack-scripting-api/entities');
var workflow = require('@jetbrains/youtrack-scripting-api/workflow');

exports.rule = entities.Issue.onChange({
	title: 'Block_review_without_pr',

	guard: function (ctx) {
		return (
			ctx.issue.fields.State && // fixing issue.Draft error
			ctx.issue.fields.State.name === ctx.State.Review.name
		);
	},

	action: function (ctx) {
		// will throw an error if user tries to move task without PR.
		const lastPr = ctx.issue.pullRequests.last();
		const hasActivePr = !!lastPr && lastPr.state.name !== 'DECLINED';

		workflow.check(hasActivePr, 'You cannot move issue without PR to Review');

		console.log('Wokred on issue ', ctx.issue.id);
	},

	requirements: {
		// Has to match states from current project
		State: {
			type: entities.EnumField.fieldType,
			Review: {
				name: 'Review',
			},
		},
	},
});
