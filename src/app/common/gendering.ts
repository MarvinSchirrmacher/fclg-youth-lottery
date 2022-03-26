import Immutable from "immutable"

export enum Gender {
  Male = 'male',
  Female = 'female',
  Diverse = 'diverse'
}

export function formOfAddress(gender: Gender): string  {
  return formsOfAddress.get(gender)!
}

export var formsOfAddress = Immutable.Map<Gender, string>({
  [Gender.Male]: 'Herr',
  [Gender.Female]: 'Frau',
  [Gender.Diverse]: 'Divers'
})

export function article(gender: Gender): string {
  return articles.get(gender)!
}

var articles = Immutable.Map<Gender, string>({
  [Gender.Male]: 'der',
  [Gender.Female]: 'die',
  [Gender.Diverse]: 'das'
})

export function perPronoun(gender: Gender): string {
  return perPronouns.get(gender)!
}

var perPronouns = Immutable.Map<Gender, string>({
  [Gender.Male]: 'er',
  [Gender.Female]: 'sie',
  [Gender.Diverse]: 'es'
})

/* possessive pronoun */

// nominative masculine
export function posPronounNomMas(gender: Gender): string {
  return posPronounsNomMas.get(gender)!
}

var posPronounsNomMas = Immutable.Map<Gender, string>({
  [Gender.Male]: 'sein',
  [Gender.Female]: 'ihr',
  [Gender.Diverse]: 'sein'
})

// nominative feminine
export function posPronounNomFem(gender: Gender): string {
  return posPronounsNomFem.get(gender)!
}

var posPronounsNomFem = Immutable.Map<Gender, string>({
  [Gender.Male]: 'seine',
  [Gender.Female]: 'ihre',
  [Gender.Diverse]: 'seine'
})

// nominative neuter
export function posPronounNomNeu(gender: Gender): string {
  return posPronounsNomNeu.get(gender)!
}

var posPronounsNomNeu = Immutable.Map<Gender, string>({
  [Gender.Male]: 'sein',
  [Gender.Female]: 'ihr',
  [Gender.Diverse]: 'sein'
})

// accusative masculine
export function posPronounAccMas(gender: Gender): string {
  return posPronounsAccMas.get(gender)!
}

var posPronounsAccMas = Immutable.Map<Gender, string>({
  [Gender.Male]: 'seinen',
  [Gender.Female]: 'ihren',
  [Gender.Diverse]: 'seinen'
})

// accusative feminine
export function posPronounAccFem(gender: Gender): string {
  return posPronounsAccFem.get(gender)!
}

var posPronounsAccFem = Immutable.Map<Gender, string>({
  [Gender.Male]: 'seine',
  [Gender.Female]: 'ihre',
  [Gender.Diverse]: 'seine'
})

// accusative neuter
export function posPronounAccNeu(gender: Gender): string {
  return posPronounsAccNeu.get(gender)!
}

var posPronounsAccNeu = Immutable.Map<Gender, string>({
  [Gender.Male]: 'seinen',
  [Gender.Female]: 'ihren',
  [Gender.Diverse]: 'seinen'
})

/* nouns */

export function participantNoun(gender: Gender): string {
  return participantNouns.get(gender)!
}

var participantNouns = Immutable.Map<Gender, string>({
  [Gender.Male]: 'Teilnehmer',
  [Gender.Female]: 'Teilnehmerin',
  [Gender.Diverse]: 'Teilnehmer'
})

export function winnerNoun(gender: Gender): string {
  return winnerNouns.get(gender)!
}

var winnerNouns = Immutable.Map<Gender, string>({
  [Gender.Male]: 'Gewinner',
  [Gender.Female]: 'Gewinnerin',
  [Gender.Diverse]: 'Gewinner'
})