type MetaItem =
  | {
      charset: string;
      name?: never;
      property?: never;
      "http-equiv"?: never;
      content?: never;
    }
  | {
      name: string;
      content: string;
      charset?: never;
      property?: never;
      "http-equiv"?: never;
    }
  | {
      property: string;
      content: string;
      charset?: never;
      name?: never;
      "http-equiv"?: never;
    }
  | {
      "http-equiv": string;
      content: string;
      charset?: never;
      name?: never;
      property?: never;
    };
