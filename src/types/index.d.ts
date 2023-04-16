export {}

declare global {
  namespace Express {
    interface Response {
      advancedResults: any
      searchResult: any
    }
    interface Request {
      advancedResults: any,
      searchResult: any
    }
  }
}