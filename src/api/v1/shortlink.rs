use axum::extract::{Path, Query};
use axum::{Extension, Json};
use axum::response::Redirect;

use crate::api::response::Resp;
use crate::model::result::{Result, Response};
use crate::model::shortlink::{CreateRequest, CreateResponse, DetailRequest, DetailResponse};
use crate::model::user::CurrentUser;
use crate::service;

pub async fn create(
    Extension(current_user): Extension<CurrentUser>,
    Json(params): Json<CreateRequest>,
) -> Resp<CreateResponse> {
    let link = params.link;
    let shortlink = service::shortlink::create(current_user, &link).await?;

    Ok(Response::success(CreateResponse::from(shortlink)))
}

pub async fn detail(Query(params): Query<DetailRequest>) -> Resp<DetailResponse> {
    let shortlink = service::shortlink::detail(&(params.short)).await?;

    Ok(Response::success(DetailResponse::from(shortlink)))
}

pub async fn redirect(Path(short): Path<String>) -> Result<Redirect> {
    let shortlink = service::shortlink::detail(short.as_str()).await?;

    Ok(Redirect::temporary(shortlink.link.as_str()))
}