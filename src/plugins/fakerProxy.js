// A sample of faker data to avoid loading massive faker lib in browser

module.exports = {
  name: {
    firstName: () => "Maye",
    lastName: () => "Emmerich",
    findName: () => "Mrs. Ahmed Batz",
    jobTitle: () => "Product Communications Administrator",
    prefix: () => "Miss",
    suffix: () => "III",
    title: () => "Central Infrastructure Designer",
    jobDescriptor: () => "Regional",
    jobArea: () => "Intranet",
    jobType: () => "Producer"
  },
  address: {
    zipCode: () => "86510-8808",
    city: () => "South Serena",
    cityPrefix: () => "South",
    citySuffix: () => "stad",
    streetName: () => "Camila Spurs",
    streetAddress: () => "89125 Cummerata Hill",
    streetSuffix: () => "Pine",
    streetPrefix: () => "a",
    secondaryAddress: () => "Suite 403",
    county: () => "Cambridgeshire",
    country: () => "Egypt",
    countryCode: () => "SN",
    state: () => "Michigan",
    stateAbbr: () => "CT",
    latitude: () => "-26.8239",
    longitude: () => "169.6479"
  },
  company: {
    suffixes: () => ["Inc", "and Sons", "LLC", "Group"],
    companyName: () => "Kutch and Sons",
    companySuffix: () => "LLC",
    catchPhrase: () => "Streamlined global definition",
    bs: () => "synergistic whiteboard interfaces",
    catchPhraseAdjective: () => "Universal",
    catchPhraseDescriptor: () => "tertiary",
    catchPhraseNoun: () => "orchestration",
    bsAdjective: () => "killer",
    bsBuzz: () => "repurpose",
    bsNoun: () => "metrics"
  },
  lorem: {
    word: () => "dignissimos",
    words: () => "atque ratione alias",
    sentence: () => "Ipsam enim repellat tempore ab ipsum consequuntur.",
    slug: () => "aut-aut-fuga",
    sentences: () =>
      "Quo consequatur et omnis. Quam doloremque incidunt et cumque alias. Odio nemo aspernatur saepe voluptatem ut autem enim. Sed reiciendis sint est. Earum est quia id eveniet qui non aliquam pariatur.",
    paragraph: () =>
      "Quis ab nemo dolores. Aut consequatur vel dolorem quia dolore in adipisci. Voluptatum unde harum cumque autem odit et ad deleniti est. Asperiores sunt sit error excepturi quis veniam et nihil.",
    paragraphs: () =>
      "Unde et et. Perspiciatis esse quos molestiae. Dolores commodi laborum enim nisi. Iusto eius eligendi ut atque beatae voluptate neque.\n \rHarum et modi. Doloribus autem maxime nihil. Voluptatem quas nemo est rerum eum eius natus culpa.\n \rEt ullam voluptas earum animi unde est. Dignissimos consequatur nostrum sit omnis repellendus doloribus qui. Dolorem ut voluptas fugiat occaecati. Distinctio blanditiis dolorem non nihil iste.",
    text: () => "Exercitationem nesciunt sit possimus.",
    lines: () => "Sunt quas aperiam.\nIn dolor magni."
  },
  hacker: {
    abbreviation: () => "XML",
    adjective: () => "online",
    noun: () => "card",
    verb: () => "synthesize",
    ingverb: () => "programming",
    phrase: () =>
      "hacking the firewall won't do anything, we need to copy the redundant SMTP panel!"
  },
  finance: {
    account: () => "92799041",
    accountName: () => "Auto Loan Account",
    mask: () => "1987",
    amount: () => "196.94",
    transactionType: () => "withdrawal",
    currencyCode: () => "XPD",
    currencyName: () => "Sudanese Pound",
    currencySymbol: () => "RM",
    bitcoinAddress: () => "3JLSMYHCAODI66337T2VE12GTL2E",
    iban: () => "BE81460200862047",
    bic: () => "NIAEMLX1655"
  },
  internet: {
    avatar: () =>
      "https://s3.amazonaws.com/uifaces/faces/twitter/anaami/128.jpg",
    email: () => "Jarod_Yundt@yahoo.com",
    exampleEmail: () => "Bernhard44@example.com",
    userName: () => "Mariana_Hane",
    protocol: () => "https",
    url: () => "http://tanya.com",
    domainName: () => "helga.biz",
    domainSuffix: () => "biz",
    domainWord: () => "jason",
    ip: () => "0.4.240.199",
    ipv6: () => "c6eb:01a9:268b:5b28:68f7:39ac:db07:1e65",
    userAgent: () =>
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_1)  AppleWebKit/534.1.2 (KHTML, like Gecko) Chrome/31.0.892.0 Safari/534.1.2",
    color: () => "#2c8033",
    mac: () => "78:e9:d1:10:67:af",
    password: () => "f2ra9fDB5H1_9A7"
  },
  commerce: {
    color: () => "white",
    department: () => "Movies",
    productName: () => "Tasty Granite Bacon",
    price: () => "874.00",
    productAdjective: () => "Refined",
    productMaterial: () => "Steel",
    product: () => "Hat"
  },
  database: {
    column: () => "title",
    type: () => "date",
    collation: () => "cp1250_general_ci",
    engine: () => "MEMORY"
  },
  system: {
    fileName: () => "connecting_azure.hpgl",
    commonFileName: () => "nebraska.mp3",
    mimeType: () => "application/vnd.yamaha.openscoreformat",
    commonFileType: () => "text",
    commonFileExt: () => "wav",
    fileType: () => "model",
    fileExt: () => "rs",
    semver: () => "8.9.5"
  },
  date: {
    past: () => "2017-01-23T15:33:58.440Z",
    future: () => "2018-04-20T22:04:24.836Z",
    between: () => "2018-04-20T22:04:24.836Z",
    recent: () => "2017-06-17T12:05:54.184Z",
    month: () => "February",
    weekday: () => "Friday"
  },
  random: {
    number: () => 32314,
    arrayElement: () => "a",
    objectElement: () => "bar",
    uuid: () => "0f48706c-a1ab-4952-9f2e-e6e0fd47df0d",
    boolean: () => true,
    word: () => "Valleys",
    words: () => "fuchsia mint green",
    image: () => "http://lorempixel.com/640/480/city",
    locale: () => "tr",
    alphaNumeric: () => "q"
  }
};
