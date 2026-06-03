import service from "@/utils/request"

export function login(data) {
    return service({
        url: '/user/login',
        method: 'post',
        data
    })
}

export function categoryTree() {
    return service({
        url: '/knowledge/category/tree',
        method: 'get',
    })
}

export function articlePage(params) {
    return service({
        url: '/knowledge/article/page',
        method: 'get',
        params,
    })
}

export function uploadFile(file, businessInfo) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('businessType', 'ARTICLE')
    formData.append('businessId', businessInfo.businessId)
    formData.append('businessField', 'cover')
    return service({
        url: '/file/upload',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export function createArticle(data) {
    return service({
        url: '/knowledge/article',
        method: 'post',
        data,
    })
}

export function getArticleDetail(id) {
    return service({
        url: `/knowledge/article/${id}`,
        method: 'get',
    })
}

export function changeArticleStatus(id, data) {
    return service({
        url: `/knowledge/article/${id}/status`,
        method: 'put',
        data
    })
}

export function deleteArticle(id) {
    return service({
        url: `/knowledge/article/${id}`,
        method: 'delete'
    })
}

export function getConsultationPage(params) {
    return service({
        url: '/psychological-chat/sessions',
        method: 'get',
        params,
    })
}

export function getSessionDetail(sessionId) {
    return service({
        url: `/psychological-chat/sessions/${sessionId}/messages`,
        method: 'get',
    })
}

export function getEmotionalPage(params) {
    return service({
        url: '/emotion-diary/admin/page',
        method: 'get',
        params,
    })
}

export function deleteEmotional(id) {
    return service({
        url: `/emotion-diary/admin/${id}`,
        method: 'delete',
    })
}

export function getAnalyticsOverview() {
    return service({
        url: '/data-analytics/overview',
        method: 'get',
    })
}

export function logout() {
    return service({
        url: '/user/logout',
        method: 'post',
    })
}