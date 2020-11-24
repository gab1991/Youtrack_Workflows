/**
 * This is a template for an on-change rule. This rule defines what
 * happens when a change is applied to an issue.
 *
 * For details, read the Quick Start Guide:
 * https://www.jetbrains.com/help/youtrack/incloud/2020.4/Quick-Start-Guide-Workflows-JS.html
 */

var entities = require('@jetbrains/youtrack-scripting-api/entities');

exports.rule = entities.Issue.onChange({
  // TODO: give the rule a human-readable title
  title: 'Pr_accepted',
  guard: function(ctx) {
    // TODO specify the conditions for executing the rule
    return true;
  },
  action: function(ctx) {
    var issue = ctx.issue;
    // TODO: specify what to do when a change is applied to an issue
  },
  requirements: {
    // TODO: add requirements
  }
});