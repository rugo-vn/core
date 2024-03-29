import { BasePlugin } from 'rugo-common';
import createModel from './src/index.js';
import { types } from './src/validate.js';

types.upload = {
  type(value){
    if (typeof value !== 'string')
      throw new InvalidTypeError(value, 'upload');

    return value;
  }
}

export default {
  ...BasePlugin,

  name: 'model',
  depends: ['drivers'],

  async start (context) {
    const schemas = JSON.parse(process.env.MODEL_SCHEMAS);
    const models = {};

    const makeModel = async (name, schema) => {
      // null check
      if (!name)
        return null;

      // direct/update schema change
      if (schema){
        models[name] = await createModel(context.drivers[schema.__type], {
          ...schema,
          __name: name
        });
        
        return models[name];
      }

      // cached
      if (models[name]) { return models[name]; }

      // defined in env
      for (const schema of schemas) {
        if (schema.__name === name) {
          models[name] = await createModel(context.drivers[schema.__type], {
            ...schema,
            __name: name
          });
          
          return models[name];
        }
      }

      return null;
    };

    context.model = makeModel;
    context.schemas = schemas;
  },
  async close () {

  }
};
