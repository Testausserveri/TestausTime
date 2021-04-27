import * as yup from 'yup';

const heartbeatSchema = yup.object().shape({
    project: yup.string().required().min(3).max(30),
    editor: yup.string().required(),
    test: yup.boolean().default(false),
});

export default heartbeatSchema;
