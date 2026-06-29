try {
    module.exports = require('@tensorflow/tfjs-node');
} catch (error) {
    if (error.code !== 'ERR_DLOPEN_FAILED') {
        throw error;
    }

    console.warn('Falling back to @tensorflow/tfjs because @tensorflow/tfjs-node failed to load:', error.message);
    module.exports = require('@tensorflow/tfjs');
}
