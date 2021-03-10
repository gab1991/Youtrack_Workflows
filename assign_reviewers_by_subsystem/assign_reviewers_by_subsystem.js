var entities = require('@jetbrains/youtrack-scripting-api/entities');

exports.rule = entities.Issue.onChange({
	title: 'Assign_reviewers_by_subsystem',

	guard: function (ctx) {
		return (
			ctx.issue.fields.State && // fixing issue.Draft error
			ctx.issue.fields.State.name === ctx.State.Reviewing.name &&
			ctx.issue.fields.Assignee &&
			// should be unassign in order to not blocking manual assignment
			ctx.issue.fields.Assignee.isEmpty() &&
			// cheking if there is at least one subsystem assigned
			ctx.issue.fields.Subsystem.isNotEmpty() &&
			ctx.issue.pullRequests.isNotEmpty()
		);
	},

	action: function (ctx) {
		var subsystems = ctx.issue.fields.Subsystem;
		var lastPRAuthor = ctx.issue.pullRequests.last().user;

		var frontend = subsystems.find(function (subsystemName) {
			return subsystemName.name === 'Front';
		});
		var backend = subsystems.find(function (subsystemName) {
			return subsystemName.name === 'Back';
		});

		if (frontend) {
			//@ FrontEnd concrete reviewrs
			// copying group for possible mutations and excluding pr author if exists
			var frontEndReviewers = cleanUsersSetFromPrAuthor(ctx.FrontEndReviewers.users, lastPRAuthor);

			if (frontEndReviewers.length) {
				assignRandom(frontEndReviewers, ctx);
			}

			//@ FrontEnd additional reviewers
			var additionalFrEndReviewers = cleanUsersSetFromPrAuthor(ctx.FrontEndAdditionalReviewers.users, lastPRAuthor);

			if (additionalFrEndReviewers.length) {
				assignRandom(additionalFrEndReviewers, ctx);
			}

			//@ FrontEnd assign pr author if there's no one except him
			if (
				ctx.issue.fields.Assignee.isEmpty() &&
				(frontEndReviewers.length !== ctx.FrontEndReviewers.users.size ||
					additionalFrEndReviewers.length !== ctx.FrontEndAdditionalReviewers.users.size)
			) {
				ctx.issue.fields.Assignee.add(lastPRAuthor);
			}
		}

		if (backend) {
			//@ backend concrete reviewrs
			// copying group for possible mutations and excluding pr author if exists
			var backEndReviewers = cleanUsersSetFromPrAuthor(ctx.BackEndReviewers.users, lastPRAuthor);

			if (backEndReviewers.length) {
				assignRandom(backEndReviewers, ctx);
			}

			//@ backend additional reviewers
			var additionalBcEnddReviewers = cleanUsersSetFromPrAuthor(ctx.BackEndEndAdditionalReviewers.users, lastPRAuthor);

			if (additionalBcEnddReviewers.length) {
				assignRandom(additionalBcEnddReviewers, ctx);
			}

			//@ FrontEnd assign pr author if there's no one except him
			if (
				ctx.issue.fields.Assignee.isEmpty() &&
				(backEndReviewers.length !== ctx.BackEndReviewers.users.size ||
					additionalBcEnddReviewers.length !== ctx.BackEndEndAdditionalReviewers.users.size)
			) {
				ctx.issue.fields.Assignee.add(lastPRAuthor);
			}
		}

		console.log('Worked on issue ', ctx.issue.id);
	},

	requirements: {
		// Has to match states from current project
		State: {
			type: entities.EnumField.fieldType,
			Reviewing: {
				name: 'Review',
			},
		},
		Assignee: {
			type: entities.User.fieldType,
			multi: true,
		},
		Subsystem: {
			type: entities.OwnedField.fieldType,
			multi: true,
		},
		FrontEndReviewers: {
			type: entities.UserGroup,
			name: 'FrontEnd Reviewers',
		},
		FrontEndAdditionalReviewers: {
			type: entities.UserGroup,
			name: 'FrontEnd Additional Reviewers',
		},
		BackEndReviewers: {
			type: entities.UserGroup,
			name: 'BackEnd Reviewers',
		},
		BackEndEndAdditionalReviewers: {
			type: entities.UserGroup,
			name: 'BackEnd Additional Reviewers',
		},
	},
});

function getRandomWithLimit(limit) {
	return Math.floor(Math.random() * Math.floor(limit));
}

function cleanUsersSetFromPrAuthor(userSet, prAuthorObj) {
	var cleanedArrayOfUsers = [];
	userSet.forEach((user) => cleanedArrayOfUsers.push(user));

	var index = null;
	for (var i = 0; i < cleanedArrayOfUsers.length; i++) {
		if (prAuthorObj && prAuthorObj.login === cleanedArrayOfUsers[i].login) {
			index = i;
			break;
		}
	}

	if (typeof index === 'number') {
		cleanedArrayOfUsers.splice(index, 1);
	}

	return cleanedArrayOfUsers;
}

function assignRandom(arrOfUsers, ctx) {
	const randIndex = getRandomWithLimit(arrOfUsers.length);
	const reviewer = arrOfUsers[randIndex];
	ctx.issue.fields.Assignee.add(reviewer);
}
