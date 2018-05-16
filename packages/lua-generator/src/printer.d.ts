export interface Format {
  retainLines: boolean;
  compact: boolean;
  minified: boolean;
  quotes: 'single' | 'double';
  concise: boolean;
  indent: {
    style: string;
    base: number;
  };
}
