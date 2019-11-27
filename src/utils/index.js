module.exports = {
    getCurrentTime() {
        const now = new Date();
        
        const year = now.getFullYear();
        const month = (now.getMonth() + 1 < 10)? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
        const day = now.getDate();

        const hour = (now.getHours() < 10)? '0' + now.getHours() : now.getHours();
        const min = (now.getMinutes() < 10) ? '0' + now.getMinutes(): now.getMinutes();
        const sec = (now.getSeconds() < 10)? '0' + now.getSeconds(): now.getSeconds();

        return year + '-' + month  + '-' + day + ' ' + hour + ':' + min + ':' + sec;
    }
}