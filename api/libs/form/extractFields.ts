import IExtractFields from "../../interfaces/form/IExtractFields";

const extractFields: IExtractFields = (...attributes) => (form) => ({
    model: form.model,
    fields: Object.entries(form.fields)
        .filter(([attribute]) => attributes.includes(attribute))
        .reduce((acc,[attribute,field]) => ({
            [attribute]: {
                ...field,
                required: true,
                allowNull: ( field.allowNull ?? !(field.required??true) )
            }
        }), {}),
    additionalFields: Object.entries(form.additionalFields??{})
        .filter(([attribute]) => attributes.includes(attribute))
        .reduce((acc,[attribute,f]) => ({
            [attribute]: f
        }), {}),
})

export default extractFields;