const defaultValue = (value) => ({ defaultValue: value });
const index = (name = true) => ({ index: name });
const uniqueIndex = (name = true) => ({ uniqueIndex: name });
const options = (...args) => ({ options: args });
const array = (itemType = 'any') => ({ type: "array", itemType });
const asReference = (refType = "any") => ({
  type: "ref",
  refType,
  ...readonly
});
const readonly = { readonly: true };
const internal = { internal: true };
const required = { required: true };
const primaryKey = { primaryKey: true };
const asAny = { type: "any" };
const asString = { type: "string" };
const asPassword = { type: "password" };
const asText = { type: "text" };
const asMarkdown = { type: "md" };
const asNumber = { type: "number" };
const asInteger = { type: "integer" };
const asBoolean = { type: "boolean", ...defaultValue(false) };
const asDate = { type: "date" };
const asTimestamp = { type: "milliseconds" };
const asVirtual = { type: "index" };
const name = { ...asString, ...required };
const title = { ...asString };
const description = { ...asText };
const text = { ...asText };
const markdown = { ...asMarkdown };
const asProfile = { ...asReference("profile") };
const _partitionKey = { ...asVirtual, ...primaryKey };

const types = {
  stanza: {
    fields: {
      title,
      preview: asText,
      live: { ...asBoolean, ...index() },
    },
  },
  
  ending: {
    fields: {
      preview: asText,
      lines: array(),
      author: asProfile,
    },
  },

  line: {
    fields: {
      text,
      minSyllables: asNumber,
      maxSyllables: asNumber,
      endHint: asString,
    },
  },

  // comment: {
  //   fields: {
  //     text,
  //     author: asProfile,
  //   },
  // },

  // rating: {
  //   fields: {
  //     value: { ...asNumber, ...required },
  //     author: asProfile,
  //   },
  // },

  profile: {
    fields: {
      displayName: { ...asString, ...required },
      blocked: { ...asBoolean },
      user: { ...asReference("user"), ...primaryKey },
      role: { ...asString, ...readonly, ...primaryKey, options: ['guest', 'user', 'moderator', 'admin'] },
    },
  },

  // friend: {
  //   fields: {
  //     displayName: { ...asString, ...required },
  //     blocked: { ...asBoolean },
  //     profile: asProfile,
  //   },
  // },

  // setting: {
  //   fields: {
  //     _partitionKey,
  //     key: { ...asString, ...primaryKey },
  //     value: { ...asAny },
  //   },
  // },

  // privateKey: {
  //   fields: {
  //     _partitionKey,
  //     key: { ...asString, ...primaryKey },
  //     value: { ...asAny },
  //   },
  // },

  // notification: {
  //   fields: {
  //     type: { ...asString, ...options("alert", "message") },
  //     direction: { ...asInteger, ...internal, ...options(0, 1) },
  //     recipientType: { ...asString, ...options("group", "profile") },
  //     recipient: { ...asReference("profile|group") },
  //     sender: asProfile,
  //     subject: { ...asString }, //alerts have no subject
  //     message: { ...asText },
  //   },
  // },

  // invitation: {
  //   fields: {
  //     code: { ...asString },
  //   },
  // },

  // registration: {
  //   fields: {
  //     firstName: { ...asString },
  //     lastName: { ...asString },
  //     email: { ...asString, ...primaryKey },
  //     password: { ...asPassword },
  //     repeatPassword: { ...asPassword },
  //     confirmationCode: { ...asString, ...internal, defaultValue: "@uuid" },
  //     confirmed: { ...asBoolean, ...internal },
  //   },
  // },

  // passwordChangeRequest: {
  //   fields: {
  //     email: { ...asString },
  //     confirmationCode: { ...asString },
  //   },
  // },

  // folder: {
  //   fields: {
  //     name: { ...asString, ...required, ...primaryKey },
  //   },
  // },

  // compilation: {
  //   fields: {
  //     _partitionKey,
  //     scope: { ...asString, ...primaryKey },
  //     title,
  //     description,
  //   },
  // },

  // reference: {
  //   fields: {
  //     entity: { ...asReference("any") },
  //   },
  // }, // generic item representing an existing entity of any type

  // requirementType: {
  //   fields: {
  //     _partitionKey,
  //     name: { ...asString, ...required, ...primaryKey }, // e.g. User Agreement
  //   },
  // },

  // requirement: {
  //   fields: {
  //     _partitionKey,
  //     type: { ...asReference("requirementType"), ...primaryKey },
  //     priority: { ...asInteger },
  //     completed: { ...asBoolean },
  //     completedTime: { ...asTimestamp },
  //   },
  // },

  // announcement: {
  //   fields: {
  //     text,
  //     published: { ...asBoolean },
  //   },
  // },

  // Pages and Posts, SEO content
  // page: {
  //   fields: {
  //     name: { ...asString, ...required, ...uniqueIndex() },
  //     title,
  //     route: { ...asString, ...uniqueIndex() },
  //   },
  // },

  // blogPost: {
  //   fields: {
  //     title: { ...asString, ...index() },
  //     date: { ...asDate, ...index() },
  //     author: asProfile,
  //   },
  // },

  // section: {
  //   fields: {
  //     title,
  //     markdown,
  //   },
  // },

  // category: {
  //   fields: {
  //     _partitionKey,
  //     name: { ...asString, ...required, ...primaryKey },
  //   },
  // },

  // tag: {
  //   fields: {
  //     _partitionKey,
  //     name: { ...asString, ...required, ...primaryKey }, // e.g. User Agreement
  //   },
  // },

  // logentry: {
  //   fields: {
  //     type: { ...asString, ...required, ...readonly },
  //     level: { ...asInteger },
  //     text,
  //     entity: { ...asReference("any") },
  //   },
  // },
};

module.exports = types;
