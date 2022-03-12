import Immutable from "immutable"

export enum Gender {
  Male = 'male',
  Female = 'female',
  Diverse = 'diverse'
}

export function article(gender: Gender): string {
  return _article.get(gender)!
}

export function personalPronoun(gender: Gender): string {
  return _personalPronoun.get(gender)!
}

export function possessivePronoun(gender: Gender): string {
  return _possessivePronoun.get(gender)!
}

export function participantNoun(gender: Gender): string {
  return _participantNoun.get(gender)!
}

export function winnerNoun(gender: Gender): string {
  return _winnerNoun.get(gender)!
}

var _article = Immutable.Map<Gender, string>({
  [Gender.Male]: 'der',
  [Gender.Female]: 'die',
  [Gender.Diverse]: 'das'
})

var _personalPronoun = Immutable.Map<Gender, string>({
  [Gender.Male]: 'er',
  [Gender.Female]: 'sie',
  [Gender.Diverse]: 'es'
})

var _possessivePronoun = Immutable.Map<Gender, string>({
  [Gender.Male]: 'sein',
  [Gender.Female]: 'ihr',
  [Gender.Diverse]: 'sein'
})

var _participantNoun = Immutable.Map<Gender, string>({
  [Gender.Male]: 'Teilnehmer',
  [Gender.Female]: 'Teilnehmerin',
  [Gender.Diverse]: 'Teilnehmer'
})

var _winnerNoun = Immutable.Map<Gender, string>({
  [Gender.Male]: 'Gewinner',
  [Gender.Female]: 'Gewinnerin',
  [Gender.Diverse]: 'Gewinner'
})