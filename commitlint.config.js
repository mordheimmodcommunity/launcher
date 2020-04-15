module.exports = {
  extends: ['@commitlint/config-angular'],
  rules: {
    'type-enum': [
      0,
      'always',
      [
        'build',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
  },
}
