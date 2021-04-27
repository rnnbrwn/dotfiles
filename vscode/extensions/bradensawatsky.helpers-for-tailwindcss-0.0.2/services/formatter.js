function formatCamelToKebab(str){
    return str.split('').map((letter, idx) => {
        return letter.toUpperCase() === letter
         ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}`
         : letter;
      }).join('');
}

module.exports = {formatCamelToKebab}