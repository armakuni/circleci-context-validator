import Ajv, { ErrorObject } from "ajv"
import { readFile } from 'fs/promises'
import { join } from "path"
import * as schema from "../config/context_validator_schema.json"
import { load } from "js-yaml"; //todo potentially use this over ajv?
import betterAjvErrors from 'better-ajv-errors'

export default async function isValid(): Promise<Boolean> { 
    //Schema validator to include all errors, not fail at the first.
    const ajv =  new Ajv({allErrors: true})

    //Load in users context validator config file parse into data JS data structure
    const jsonProjectConfigContents = null;
    try {
        const yamlProjectConfigPath = join(__dirname, "../../example/context_validator.yml");
        const yamlProjectConfigContents = await readFile(yamlProjectConfigPath, 'utf8');
        const jsonProjectConfigContents = load(yamlProjectConfigContents, { json: true });
        // const data = {owner: {id: "***REMOVED***"}, contexts: [], nothere: ""}
    
        console.log(JSON.stringify(jsonProjectConfigContents,null,'\t'));
    } catch (e) {
        console.log('Unable to process project config', e);
    }

    //compile schema for validation
    const validate = ajv.compile(schema)

    
    const valid = validate(jsonProjectConfigContents)
    if (!valid) {
        console.log("Errored :(", validate.errors as ErrorObject[])

        const output = betterAjvErrors(schema, jsonProjectConfigContents, validate.errors as ErrorObject[]);
        console.log(output);

        return false
    }
    return true
};