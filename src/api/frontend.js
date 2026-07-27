import service from "@/utils/request"
import { fetchEventSource } from '@microsoft/fetch-event-source'

export const register = (data) => {
    return service({
        url: '/user/add',
        method: 'post',
        data
    })
}

export const startSession = (data) => {
    return service({
        url: '/psychological-chat/session/start',
        method: 'post',
        data
    })
}

export const getSessionList = (params) => {
    return service({
        url: '/psychological-chat/sessions',
        method: 'get',
        params
    })
}

export const deleteSession = (sessionId) => {
    return service({
        url: `/psychological-chat/sessions/${sessionId}`,
        method: 'delete'
    })
}

export const getSessionDetail = (sessionId) => {
    return service({
        url: `/psychological-chat/sessions/${sessionId}/messages`,
        method: 'get'
    })
}

export const streamChat = (sessionId, userMessage, callbacks) => {
    const token = localStorage.getItem('token') || ''
    const controller = new AbortController()
    let processing = Promise.resolve()

    fetchEventSource('/api/psychological-chat/stream', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'token': token,
        },
        body: JSON.stringify({ sessionId, userMessage }),
        signal: controller.signal,
        onmessage(event) {
            processing = processing.then(async () => {
                try {
                    const parsed = JSON.parse(event.data)
                    if (parsed.code === '-1' || parsed.code === -1) {
                        if (callbacks.onError) {
                            callbacks.onError(new Error(parsed.msg || '对话服务异常'))
                        }
                        controller.abort()
                        return
                    }
                    if (parsed.code && parsed.code !== '200' && parsed.code !== 200) {
                        if (callbacks.onError) {
                            callbacks.onError(new Error(parsed.msg || '对话服务异常'))
                        }
                        controller.abort()
                        return
                    }
                    const content = parsed.data?.content ?? parsed.content ?? parsed.data ?? event.data
                    if (callbacks.onChunk && content) {
                        await callbacks.onChunk(content)
                    }
                } catch {
                    if (callbacks.onChunk) {
                        await callbacks.onChunk(event.data)
                    }
                }
            })
        },
        onclose() {
            processing.then(() => {
                if (callbacks.onDone) callbacks.onDone()
            })
        },
        onerror(err) {
            if (callbacks.onError) callbacks.onError(err)
            throw err
        },
        openWhenHidden: true,
    })

    return controller
}

export const addEmotionDiary = (data) => {
    return service({
        url: '/emotion-diary',
        method: 'post',
        data
    })
}

export const getKnowledgeList = (params) => {
    return service({
        url: '/knowledge/article/page',
        method: 'get',
        params
    })
}
export const getKnowledgeDetail = (id) => {
    return service({
        url: `/knowledge/article/${id}`,
        method: 'get',
    })
}
