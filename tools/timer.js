let timer;
const startTimer = () => {
    timer = new Date();
};
exports.startTimer = startTimer;
const stopTimer = () => {
    const time = new Date() - timer;
    return `(${time}ms) `;
};
exports.stopTimer = stopTimer;
