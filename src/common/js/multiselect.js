/*
*  Control functionality for the multiselect element.
*/

class MultiSelect {
	constructor(id, validators, nodups) {
		if (!id) {
			throw new Error(
				'Invalid empty ID for multiselector.'
			);
		}

		this.enabled = true;
		this.val_valid = true;
		this.selected = [];
		this.nodups = nodups;
		this.root = $(`#${id}`);
		this.input = $(`#${id} > .ms-controls > .ms-input`);
		this.btn_add = $(`#${id} > .ms-controls > .ms-add`);
		this.values = $(`#${id} > .ms-values`);

		// Add listener for Enter keypresses.
		this.input.on('keypress', (event) => {
			if (event.key == 'Enter' && this.val_valid) {
				this.add(this.input.val());
				this.input.val('');
			}
		});

		// Add listener for the (+) button.
		this.btn_add.on('click', () => {
			this.add(this.input.val());
			this.input.val('');
		});

		// Add validators for the input.
		if (validators && validators.length) {
			this.vtrig = new ValidatorTrigger(
				[new ValidatorSelector(
					this.input,
					this.root,
					validators,
					null
				)],
				(valid) => {
					this.val_valid = valid;
					this.btn_add.prop(
						'disabled',
						!valid
					);
				}
			);
		}
	}

	add(option) {
		/*
		*  Select a new option.
		*/
		if (this.nodups && this.selected.includes(option)) {
			return;
		}
		if (!option) { return; }

		var cont = $('<div>', {
			'id': `ms-opt-${option}`,
			'class': 'ms-val',
			'text': option
		});
		var rm = $('<span>', {
			'class': 'ms-rm fas fa-times'
		});
		cont.append(rm);
		rm.on('click', () => { this.remove(option); });

		this.selected.push(option);
		this.values.append(cont);

	}

	set(options) {
		/*
		*  Select all the options in 'values'.
		*/

		// Clear existing selections.
		this.selected = [];
		this.values.html('');

		// Add new selections.
		for (let o of options) { this.add(o); }
	}

	remove(option) {
		/*
		*  Remove the selection 'option'.
		*/
		if (!this.selected.includes(option)) {
			throw new Error(
				'Option not selected.'
			);
		}
		$(`#ms-opt-${option}`).remove();
		this.selected.splice(this.selected.indexOf(option), 1);
	}

	enable() {
		/*
		*  Enable the MultiSelect.
		*/
		this.enabled = true;
		this.values.css('background-color', 'white');
		this.input.prop('disabled', false);
		for (let s of this.vtrig.selectors) { s.enable(); }
		if (this.vtrig.is_valid()) {
			this.btn_add.prop('disabled', false);
		}
	}

	disable() {
		/*
		*  Disable the MultiSelect.
		*/
		this.enabled = false;
		this.values.css('background-color', 'var(--gray-3)');
		this.input.prop('disabled', true);
		this.btn_add.prop('disabled', true);
		for (let s of this.vtrig.selectors) { s.disable(); }
	}
}
