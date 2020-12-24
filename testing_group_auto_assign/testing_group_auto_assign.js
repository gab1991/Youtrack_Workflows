var entities = require('@jetbrains/youtrack-scripting-api/entities');
var workflow = require('@jetbrains/youtrack-scripting-api/workflow');

exports.rule = entities.Issue.onChange({
	title: 'testing_group_auto_assign',

	guard: function (ctx) {
		return (
			ctx.issue.fields.State && // fixing issue.Draft error
			ctx.issue.fields.State.name === ctx.State.Testting.name &&
			ctx.issue.fields.Assignee &&
			// should be unassign in order to not blocking manual assignment
			ctx.issue.fields.Assignee.isEmpty()
		);
	},

	action: function (ctx) {
		function getRandomWithLimit(limit) {
			return Math.floor(Math.random() * Math.floor(limit));
		}

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

		ctx.issue.fields.Assignee.add(randomUser);
	},

	requirements: {
		// Has to match states from current project
		State: {
			type: entities.EnumField.fieldType,
			Testting: {
				name: 'Testing',
			},
		},
		Assignee: {
			type: entities.User.fieldType,
			multi: true,
		},
		TestingGroup: {
			type: entities.UserGroup,
			name: 'Testing Assignees',
		},
	},
});
