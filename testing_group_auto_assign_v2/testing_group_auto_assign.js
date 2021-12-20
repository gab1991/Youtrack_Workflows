var entities = require('@jetbrains/youtrack-scripting-api/entities');
var workflow = require('@jetbrains/youtrack-scripting-api/workflow');

exports.rule = entities.Issue.onChange({
	title: 'testing_group_auto_assign_v2',

	guard: function (ctx) {
		return (
			ctx.issue.fields.State && // fixing issue.Draft error
			ctx.issue.fields.State.name === ctx.State.Testing.name &&
			// should be unassign in order to not blocking manual assignment
			ctx.issue.fields.Tester === null &&
			ctx.TestingGroup.users.size
		);
	},

	action: function (ctx) {
		var isTestingGroupEmpty = ctx.TestingGroup.users.isEmpty();

		if (isTestingGroupEmpty) {
			workflow.message(
				'Add someone to "' + ctx.TestingGroup.name + '" group if you wish auto assignment, or disable the workflow',
			);
			return;
		}

		var testingGroupUsersSize = ctx.TestingGroup.users.size;
		var index = getRandomWithLimit(testingGroupUsersSize);
		var randomUser = ctx.TestingGroup.users.get(index);

		ctx.issue.fields.Tester = randomUser;
	},

	requirements: {
		// Has to match states from current project
		State: {
			type: entities.EnumField.fieldType,
			Testing: {
				name: 'Testing',
			},
		},
		Tester: {
			type: entities.User.fieldType,
			multi: false,
		},
		TestingGroup: {
			type: entities.UserGroup,
			name: 'Testing Assignees',
		},
	},
});

function getRandomWithLimit(limit) {
	return Math.floor(Math.random() * Math.floor(limit));
}
