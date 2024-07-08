# 🖥️ 온라인 공연 예매 서비스 구현
![썸네일](./imgs/thumbnail.png)


## 프로젝트 소개
- 프로젝트 이름 : Show_Ticketing_Service
- 내용 : 타입스크립트 기반 온라인 공연 예매 서비스 구현
- 구분 : 개인 프로젝트
- 배포 : https://www.mymycode.shop... (API 명세서 참조)


## 1. 개발 기간
- 2024.06.29 ~ 2024.07.07

<br>

## 2. 개발 환경
- BackEnd : TypeScript, Nest.js, TypeORM
- Tool : AWS-S3, AWS-RDS, Insomnia, DBeaver

<br>

## 3. API 명세서 및 ERD
 - API 명세서 : https://west-territory-778.notion.site/API-a3b16c82cafb471b8fc54e0e63ce47d4?pvs=4
 - ERD : https://drawsql.app/teams/nodejs-express/diagrams/-4

<br>

## 4. 주요 기능 및 설명
### 4-1. 회원가입 
#### 4-1-1. 회원가입 Controller
- 회원가입 DTO를 통해서 회원가입에 필요한 데이터를 가져와서 Service에 넘깁니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/auth/auth.controller.ts#L13-L22

#### 4-1-2. 회원가입 Service
- 비밀번호와 확인용 비밀번호를 비교해서 같지 않다면 에러를 반환합니다.

- 이메일, 닉네임 중 하나라도 중복이 있다면 에러를 반환합니다.

- (사실 중복 체크는 한 번의 Repository 접근으로도 가능할 것 같기에 수정이 필요해 보임)

- 입력받은 비밀번호를 암호화해서 데이터베이스에 사용자 정보를 저장합니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/auth/auth.service.ts#L29-L56


<br>


### 4-2. 로그인
#### 4-2-1. 로그인 Controller
- 로그인 DTO를 통해서 사용자가 입력한 이메일, 비밀번호를 가져와서 Service에 넘깁니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/auth/auth.controller.ts#L24-L28

#### 4-2-2. 로그인 Service
- 받아온 이메일로 사용자가 존재하는지 확인합니다.

- 그리고 암호화된 비밀번호와 사용자가 입력한 비밀번호를 검증합니다.

- 위 과정이 문제가 없다면 Access Token, Refresh Token을 발급합니다.

- Refresh Token은 따로 데이터베이스에 저장해서 관리합니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/auth/auth.service.ts#L58-L101


<br>


### 4-3. 로그아웃
#### 4-3-1. 로그아웃 Controller
- `RefreshTokenGuard`를 통해서 사용자가 준 Refresh Token이 유효한지 확인합니다.

- 문제가 없다면 `@UserInfo()` 커스텀 데코레이터를 통해서 Request의 사용자 데이터를 가져와서 Service에 넘깁니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/auth/auth.controller.ts#L30-L36

#### 4-3-2. 로그아웃 Service
- 한 번만 더 데이터베이스의 Refresh Token이 들어있는지 확인합니다.

- 그리고 Refresh Token은 데이터베이스에서 Soft Delete를 진행합니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/auth/auth.service.ts#L103-L119


<br>

### 4-4. 토큰 재발급
#### 4-4-1. 토큰 재발급 Controller
- `RefreshTokenGuard`를 통해서 사용자가 준 Refresh Token이 유효한지 확인합니다.

- 문제가 없다면 `@UserInfo()` 커스텀 데코레이터를 통해서 Request의 사용자 데이터를 가져와서 Service에 넘깁니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/auth/auth.controller.ts#L38-L44

#### 4-4-2. 토큰 재발급 Service
- Refresh Token이 유효한 것을 확인했느니 Access Token, Refresh Token을 재발급합니다.

- 그리고 Refresh Token은 데이터베이스에서 관리하기에 Token 컬럼의 데이터를 업데이트합니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/auth/auth.service.ts#L121-L144


<br>


### 4-5. Refresh Token 가드
- `RefreshTokenGuard`는 기존 Express에서 사용하던 Refresh Token 인증 미들웨어를 기반으로 작성되었습니다.

- 이 가드의 역할은 사용자가 준 Refresh Token가 데이터베이스에 저장된 Refresh Token과 같은지 확인합니다.

- 그리고 같다면 Request에 사용자의 정보를 넣습니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/auth/utils/refresh-token.guard.ts#L15-L58


<br>


### 4-6. Roles 가드
- `RolesGuard`는 사용자의 jwt 토큰을 검증하고 Request에 사용자 정보가 들어가면 그 사용자의 역할이 다음에 나오는 기능을 사용해도 되는지 검증하는 역할을 합니다.

- `@Roles(Role.Admin)` 와 같이 사용해서 어떤 사용자를 통과해줄 지 정해 줍니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/auth/utils/roles.guard.ts#L11-L43


<br>


### 4-7. 사용자 프로필 조회
#### 4-7-1. 사용자 프로필 조회 Controller
- `@UserInfo()` 커스텀 데코레이터를 통해서 Request에 들어있는 사용자 정보를 가져옵니다.

- 이 때, 전역에서 AuthGuard('jwt')라는 가드가 있기 때문에 사용자가 준 Access Token의 유효성 검사를 진행합니다.

- 유효하다면 Request에 사용자 정보를 넣습니다.

- 그리고 Controller의 메서드를 사용할 수 있도록 통과시켜 줍니다.


- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/user/user.controller.ts#L8-L19

#### 4-7-2. 사용자 프로필 조회 Service
- Request에 있는 사용자의 ID를 통해서 데이터베이스의 사용자 정보를 찾아서 반환합니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/user/user.service.ts#L25-L28


<br>


### 4-8. 사용자 예매 목록 조회 
#### 4-8-1. 사용자 예매 목록 조회 Controller
- `@UserInfo()` 커스텀 데코레이터를 통해서 Request에 들어있는 사용자 정보를 가져옵니다.

- 이 때, 전역에서 AuthGuard('jwt')라는 가드가 있기 때문에 사용자가 준 Access Token의 유효성 검사를 진행합니다.

- 유효하다면 Request에 사용자 정보를 넣습니다.

- 그리고 Controller의 메서드를 사용할 수 있도록 통과시켜 줍니다.

- 사용자 프로필 조회와는 다르게 Request에 들어있는 사용자 정보를 그대로 Service로 넘깁니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/user/user.controller.ts#L21-L25

#### 4-8-2. 사용자 예매 목록 조회 Service
- 받아온 사용자 정보에 있는 사용자 ID 값으로 티켓 Service에서 넘깁니다.

- 티켓 Service에서 사용자 ID를 기반해서 티켓 정보 목록을 가져옵니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/user/user.service.ts#L54-L60


<br>


### 4-9. 공연 등록 
#### 4-9-1. 공연 등록 Controller
- 공연 등록 기능은 Admin만 사용 가능한 기능으로 공연 등록 DTO를 통해서 공연의 정보를 가져옵니다.

- `RolesGuard`를 통해서 로그인한 사용자가 사용 가능한지 역할을 검사합니다.

- 공연 등록 시 이미지를 업로드해야 하기 때문에 Aws-S3와 Multer를 이용해서 파일을 업로드합니다.

- 이 때, FilesInterceptor를 이용해서 사용자가 보내준 이미지 데이터들을 가져옵니다.

- 그 이미지 데이터는 `@UploadFils()` 데코레이터를 통해서 Service에 넘깁니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/show/show.controller.ts#L24-L40

#### 4-9-2. 공연 등록 Service
- 사용자가 넘겨준 공연 정보, 이미지 데이터는 하나의 트랜젝션에서 등록되어야 하기 때문에 `QueryRunner`를 이용해서 트랜젝션 문법을 사용합니다.

- 접근하는 테이블이 하나가 아니기 때문에 트랜젝션이 없으면 일관성이 깨질 수 있습니다.

- 기본적인 공연의 정보를 저장하고 각 좌석들의 정보 역시 개별로 저장합니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/show/show.service.ts#L41-L218


<br>


### 4-10. 공연 목록 조회
#### 4-10-1. 공연 목록 조회 Controller
- 공연 목록 조회는 전체 목록 조회와 카테고리 별 조회가 가능합니다.

- 카테고리 별 조회를 할 때는 URL상에 `쿼리 스트링`을 사용해서 사용자가 선택한 카테고리 데이터를 가져옵니다.

- 그러한 카테고리 데이터를 Service에 넘겨 줍니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/show/show.controller.ts#L42-L46

#### 4-10-2. 공연 목록 조회 Service
- 어떤 카테고리로 조회할 지 데이터를 가져와서 데이터베이스에서 검색 합니다.

- 카테고리가 있으면 카테고리로 검새하고 아니면 전체를 반환합니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/show/show.service.ts#L220-L248


<br>


### 4-11. 공연 상세 조회 
#### 4-11-1. 공연 상세 조회 Controller
- `Path Parameter`를 통해서 어떤 공연을 상세 조회할 지 공연 ID를 가져옵니다.

- 가져온 공연 ID를 Service에 넘깁니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/show/show.controller.ts#L54-L58

#### 4-11-2. 공연 상세 조회 Service
- Controller에서 넘겨준 공연 ID로 데이터베이스에서 검색하고 해당 공연의 데이터를 가져옵니다.

- `relations` 옵션을 사용해서 관계를 형성한 다른 테이블의 데이터도 가져옵니다.

- 형식에 맞도록 정리해서 반환합니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/show/show.service.ts#L280-L324


<br>


### 4-12. 공연 검색
#### 4-12-1. 공연 검색 Controller
- 제목을 통해서 공연을 검색하는 기능입니다.

- 사용자가 입력한 검색어는 `쿼리 스트링`을 통해서 가져와서 Service에 넘깁니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/show/show.controller.ts#L48-L52

#### 4-12-2. 공연 검색 Service
- 원래는 그냥 TypeORM에서 제공해주는 메서드를 통해서 검색하려고 했는데, 쿼리 빌더를 통해서도 데이터베이스에 접근할 수 있다고 해서 한 번 활용했습니다.

- 사용 방법은 약간 Raw Query에 가까운 방식을 사용합니다.

- 그리고 해당 제목의 일부만 있어도 검색 가능하게 만들기 위해서 SQL의 LIKE와 같은 조건을 where 절에 넣어서 검색합니다.

- https://github.com/jkc-mycode/Show_Ticketing/blob/829bfeffab9cbdb159ffaacce60768b81a65ae73/src/show/show.service.ts#L250-L278


<br>


### 4-13. 공연 좌석 정보 조회
#### 4-13-1. 공연 좌석 정보 조회 Controller
- 

#### 4-13-2. 공연 좌석 정보 조회 Service
- 


<br>


### 4-14. 공연 지정 좌석 예매
#### 4-14-1. 공연 지정 좌석 예매 Controller
- 

#### 4-14-2. 공연 지정 좌석 예매 Service
- 


<br>


### 4-15. 공연 예매 취소 
#### 4-15-1. 공연 예매 취소 Controller
- 

#### 4-15-2. 공연 예매 취소 Service
- 


<br>


### 4-16. 좌석 예매 여부 체크 인터셉터
- 


<br>



## 5. API 테스트 사진 첨부

- 회원가입 API
![회원가입 API](./imgs/sign-up.png)

- 로그인 API
![로그인 API](./imgs/sign-in.png)

- 내 정보 조회 API
![내 정보 조회 API](./imgs/user_info.png)

- 이력서 생성 API
![이력서 생성 API](./imgs/resume_create.png)

- 이력서 목록 조회 API
![이력서 목록 조회 API](./imgs/resume_list.png)

- 이력서 상세 조회 API
![이력서 상세 조회 API](./imgs/resume_detail.png)

- 이력서 수정 API
![이력서 수정 API](./imgs/resume_update.png)

- 이력서 삭제 API
![이력서 삭제 API](./imgs/resume_delete.png)

- 이력서 지원 상태 변경 API
![이력서 지원 상태 변경 API](./imgs/resume_change_state.png)

- 이력서 로그 목록 조회 API
![이력서 로그 목록 조회 API](./imgs/resume_log_list.png)

- 토큰 재발급 API
![토큰 재발급 API](./imgs/token_refresh.png)

- 로그아웃 API
![로그아웃 API](./imgs/sign-out.png)

<br>

## 6. 어려웠던 점
### 6-1. 인증 미들웨어의 Prisma 코드 변경
- 

<br>

### 6-2. 테스트 코드 구현 자체의 어려움
- 

<br>
