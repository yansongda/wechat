import api from '@api/totp'
import { CODE } from '@constant/error'
import { HttpError, WeixinError } from '@models/error'
import type { Item } from 'miniprogram/types/totp'
import type { WeuiSlideviewButtonTap } from 'miniprogram/types/wechat'

interface Dataset {
  id: string
}

Page({
  data: {
    toptipError: '',
    slideViewButtons: [{ text: '备注' }, { type: 'warn', text: '删除' }],
    items: [] as Item[]
  },
  async onShow() {
    await this.all()
  },
  onHide() {
    this.clearRefreshInterval()
  },
  onUnload() {
    this.clearRefreshInterval()
  },
  async all() {
    await wx.showLoading({ title: '加载中' })

    this.clearRefreshInterval()

    api
      .all()
      .then((response) => {
        this.setData({ items: response })
        this.refreshInterval()
      })
      .catch((e: HttpError) => {
        this.setData({ toptipError: e.message })
      })
      .finally(() => {
        wx.hideLoading().catch()
      })
  },
  async create() {
    const scan = await wx.scanCode({ scanType: ['qrCode'] }).catch(() => {
      throw new WeixinError(CODE.WEIXIN_QR_CODE)
    })

    api
      .create(scan.result)
      .catch((e: HttpError) => {
        this.setData({ toptipError: e.message })
      })
      .finally(async () => {
        await this.all()
      })
  },
  async edit(id: number) {
    this.clearRefreshInterval()

    await wx.navigateTo({ url: '/pages/totp/edit?id=' + id })
  },
  async delete(id: number) {
    const result = await wx.showModal({ title: '是否确定删除？', content: '删除后数据不可恢复' })

    if (result.cancel) {
      return
    }

    api
      .deleteTotp(id)
      .catch((e: HttpError) => {
        this.setData({ toptipError: e.message })
      })
      .finally(async () => {
        await this.all()
      })
  },
  async refreshCode(id: number, index: number) {
    api
      .detail(id)
      .then((response) => {
        this.setData({ [`items[${index}].code`]: response.code })
      })
      .catch((e: HttpError) => {
        this.setData({ toptipError: e.message })
      })
  },
  async slideviewButtonTap(e: WeuiSlideviewButtonTap<Dataset, unknown>) {
    const id = Number(e.currentTarget.dataset.id)

    switch (e.detail.index) {
      case 0:
        // 备注
        await this.edit(id)
        break
      case 1:
        // 删除
        await this.delete(id)
        break
    }
  },
  refreshInterval() {
    this.data.items.forEach((item, index) => {
      const intervalIdentity = setInterval(async () => {
        const period = item.period ?? 30

        let remainSeconds = period - new Date().getSeconds()
        if (remainSeconds <= 0) {
          remainSeconds += period
        }

        this.setData({ [`items[${index}].remainSeconds`]: remainSeconds })

        if (remainSeconds == period) {
          await this.refreshCode(item.id, index)
        }
      }, 1000)

      this.setData({ [`items[${index}].intervalIdentity`]: intervalIdentity })
    })
  },
  clearRefreshInterval() {
    this.data.items.forEach((item, index) => {
      if (item.intervalIdentity && item.intervalIdentity > 0) {
        clearInterval(item.intervalIdentity)
      }

      this.setData({ [`items[${index}].intervalIdentity`]: -1 })
    })
  }
})

export default {}
