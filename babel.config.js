module.exports = api => {
  const env = api.env();
  api.cache(true);

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          loose: true,
          targets: { node: env === 'production' ? '8' : 'current' },
        },
      ],
      ['@babel/preset-stage-0', { loose: true, decoratorsLegacy: true }],
    ],
    retainLines: true,
  };
};
