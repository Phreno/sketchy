let timer;
const startTimer = () => {
    timer = new Date();
};
exports.startTimer = startTimer;
const stopTimer = () => {
    const time = `${new Date() - timer}`.padStart(6, ".");
    return `(${time}ms) `;
};
exports.stopTimer = stopTimer;


