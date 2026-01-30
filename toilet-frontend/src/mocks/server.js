import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// リクエストを受け付けるモックサーバーを作成します
export const server = setupServer(...handlers)