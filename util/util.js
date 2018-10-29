module.exports = {
    log: (type, message) => {
        if (type == "success") {
            console.log((new Date()) + "\t" + message);
        } else if (type == "error") {
            console.error((new Date()) + "\t" + message);
        } else {
            console.log("util - invalid input");
        }
    }
}