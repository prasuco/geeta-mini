import converter from 'number-to-words'

export const n2w = (value) => {
    return converter.toWords(value)
}