RocketChat.settings.addGroup('Smarsh', function addSettings() {
	this.add('Smarsh_Enabled', false, {
		type: 'boolean',
		i18nLabel: 'Smarsh_Enabled',
		enableQuery: {
			_id: 'From_Email',
			value: {
				$exists: 1,
				$ne: ''
			}
		}
	});
	this.add('Smarsh_Email', '', {
		type: 'string',
		i18nLabel: 'Smarsh_Email',
		placeholder: 'email@domain.com'
	});
	this.add('Smarsh_Interval', 'every_30_minutes', {
		type: 'select',
		values: [{
			key: 'every_30_seconds',
			i18nLabel: 'every_30_seconds'
		}, {
			key: 'every_30_minutes',
			i18nLabel: 'every_30_minutes'
		}, {
			key: 'every_1_hours',
			i18nLabel: 'every_hour'
		}, {
			key: 'every_6_hours',
			i18nLabel: 'every_six_hours'
		}],
		enableQuery: {
			_id: 'From_Email',
			value: {
				$exists: 1,
				$ne: ''
			}
		}
	});
});
