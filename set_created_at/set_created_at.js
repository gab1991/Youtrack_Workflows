var entities = require('@jetbrains/youtrack-scripting-api/entities');

exports.rule = entities.Issue.onChange({
	title: 'set_created_at',

	guard: function (ctx) {
		// work only if target field is empty
		return !ctx.issue.fields.CreatedAt;
	},

	action: function (ctx) {
		ctx.issue.fields.CreatedAt = ctx.issue.created;
	},

	requirements: {
		CreatedAt: {
			type: entities.Field.dateTimeType,
			name: 'Created at',
		},
	},
});
