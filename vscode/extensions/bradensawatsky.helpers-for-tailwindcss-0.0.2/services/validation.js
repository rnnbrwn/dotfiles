function validateCSSClassName(n){
	return /^[a-z_-][a-z\d:_-]*$/i.test(n);
}

function validateVueComponentName(n){
	return /^[a-zA-Z]*$/i.test(n);
}

module.exports = {validateCSSClassName, validateVueComponentName}