const getImagePrefix = () => {
    return process.env.NODE_ENV === "production"
        ? "public/"
        : "";
};

export { getImagePrefix };