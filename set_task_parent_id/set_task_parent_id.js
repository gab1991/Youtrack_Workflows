const entities = require('@jetbrains/youtrack-scripting-api/entities');

exports.rule = entities.Issue.onChange({
	title: 'Set_task_parent_id',
	guard: (ctx) => {
		return ctx.issue.links['subtask of'].isNotEmpty();
	},
	action: (ctx) => {
		const parents = ctx.issue.links['subtask of'];
		const parentIds = [];

		parents.forEach((parent) => {
			parentIds.push(parent.id);
		});

		ctx.issue.fields.parentIdField = parentIds.join(' ');
	},
	requirements: {
		parentIdField: {
			type: entities.Field.textType,
			name: 'parent_id',
		},
	},
});
