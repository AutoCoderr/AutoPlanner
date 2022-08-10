export default (value) => new RegExp("^[a-zA-Z0-9_\\-\\.]+@[a-zA-Z]+\\.[a-z]{2,3}$").test(value) && value.length <= 50;
