import IExtractFields from "../../interfaces/form/IExtractFields";

const extractFields: IExtractFields = (...attributes) => (form) => ({
    fields: Object.entries(form.fields)
        .filter(([attribute]) => attributes.includes(attribute))
        .reduce((acc,[attribute,field]) => ({
            [attribute]: {
                ...field,
                required: true
            }
        }), {})
})

export default extractFields;