//1. intrestingness list를 가져오자
//2. 갤러리 구조 만들고
//3.썸네일 클릭시 팝업 생성 , 닫기 버튼 클릭시 팝업제거
//4.  소스 이미지 에러가 나면 대체 이미지로 출력
//5.isolayout 적용-> isolayout 적용 되면 gallery프레임 출력 (초기에 로딩된것만 height 계산해서 출력되서 )
//6.레이어 팝업 호출시 스크롤 기능 제거
//7.로딩gif 추가
//8. user_url , user_search 사용
//9. (success에 있는 코드 함수로 분리)creatList 함수 만들어서 동적 갤러리코드 담아줌  items파라미터
//10.(success에 있는 코드 함수로 분리)imgLoaded 함수 만들어서 이미지 소스 로딩 완ㄹ료시 레이아웃 적용 코드 담아줌
//11.메서드형식 쿼리스트링으로 분리
//12.isotope에서 선택자 구문 오류 수정 뭔지 모르겠음
//13.ajax호출부를 함수로 정의해서 옵션으로 메서드 타입과 추가 정보 입력
//14.검색어 입력 후 클릭시 검색된 내용 재출력 +로고 클릭시 갤러리 리스트 초기화
//15.검색어 미입력 , 빈칸 입력 경고창 , 복수개 검색어 입력시 , 로 구분서 문자열 옵션 객체제 전달
//16.검색기능 함수로 만들고 엔터키 입력하면 검색기능 호출
//17.사용자 아이디 클릭시 해당 사용자의 갤러리 이미지만 호출
//18.검색 결과 없을 시 경고창 띄우고 다시 interest버전으로 갤러리 호출
//19.결과 이미지의 갯수가 최대 이미지보다 적을 때 최대 이미지 결과 이미지 갯수로 변경
//선생님 키 좀 사용할게요
this.frame = $('section')
this.h1 = this.frame.find('h1')
this.gallery = this.frame.find('#gallery')
this.searchBox = this.frame.find('#searchBox')
this.searchInput = this.searchBox.find('input')
this.searchBtn = this.searchBox.find('button')
this.key = 'cf213181fbdb73a0ce6d71164837c0c8'
this.num = 100
this.url = 'https://www.flickr.com/services/rest'
this.interest = 'flickr.interestingness.getList'
this.user = 'flickr.people.getPhotos'
this.search = 'flickr.photos.search'

//처음 로딩시 interest 데이터 호출
getItems()

//검색창에 검색어 입력후 클릭시
searchBtn.on('click', getTags)

/*
  keypress : shift, alt, 한글입력시 미지원키 발생
  keydown : 키를 누르는 동안
  keyup : 키를 눌렀다가 떼는 순간
  
*/

//enter해도 검색되게
searchInput.on('keyup', function (e) {
  if (e.key === 'Enter') getTags()
})

//로고 클릭하면 다시 갤러리 리스트 초기화
h1.on('click', function () {
  getItems()
})

//썸네일 클릭시 팝업 생성
$('body').on('click', '#gallery ul li>.inner>a', function (e) {
  // 이거 왜 사용했지 ?
  e.preventDefault()
  $('body').css('overflow', ' hidden')
  const imgSrc = $(e.currentTarget).attr('href')

  $('body').append(
    $('<aside class="pop">').append(
      $('<img>').attr('src', imgSrc),
      $('<span>').text('close'),
    ),
  )

  $('.pop').fadeIn(1000)
})

//닫기 버튼 클릭시 팝업 제거
$('body').on('click', '.pop span', function () {
  $('body').css('overflow', 'auto')
  $('.pop').fadeOut(1000, function () {
    $('.pop').remove()
  })
})

//사용자 아이디 클릭시 해당 사용자의 이미지만 호출
$('body').on('click', '.profile span', function (e) {
  const user_id = $(e.currentTarget).text()
  getItems({
    user_id: user_id,
    method: user,
  })
})

//ajax
function getItems(opt) {
  $(gallery.selector + ' ul').removeClass('loaded')
  $('.loading').removeClass('off')
  /*
  웹서버 API데이터 요청시 다양한 옵션값들을 기존 URL뒤에 문자열 형태로 전달하는 방식
  QueryString
  기본URL?키1=값1&키2=값2
  url?api_key=key&per_page=500
*/
  //ajax호출시 기본 쿼리 스트링 객체 설정
  let default_opt = {
    method: interest,
    api_key: key,
    per_page: num,
    format: 'json',
    nojsoncallback: 1,
  }
  //기존 객체에 사용자가 입력한 객체를 합쳐서
  let result_opt = { ...default_opt, ...opt }

  $.ajax({
    url: url,
    dataType: 'json',
    //ajax호출시 합친 객체쿼리를 전송
    data: result_opt,
  })
    .success(function (data) {
      //이미지가 없으면 alert
      if (data.photos.photo.length === 0) {
        alert('검색결과가 없습니다.')
        getItems()
      } else {
        //지정한 최대 이미지 갯수보다 결과 이미지 갯수가 적으면
        //결과 이미지 갯수를 최대 이미지 갯수로 변경
        if (data.photos.photo.length < num) num = data.photos.photo.length
        crreateList(data.photos.photo)
        imgLoaded()
      }
    })
    .error(function (err) {
      console.log(err)
    })
}

//갤러리 만드는 함수
function crreateList(items) {
  //.empty() 선택한 요소의 내용 지운다 태그는 남아 있다
  //.remove() 태그 포함한 요소 전체 제거
  gallery.empty()
  $('#gallery').append('<ul>')
  //사용안하는 파라미터 $(items).each(function(_, data){    이렇게  언더바로 표현
  $(items).each(function (_, data) {
    //title 없으면  저 text 나와요
    let text = data.title

    //삼항연산자로 title길이 50 넘으면  말줄임 사용
    text.length > 50 ? (text = text.substr(0, 50) + '...') : text
    if (!data.title) text = 'No description in this photo'

    gallery.find('ul').append(
      $('<li>').append(
        $('<div class="inner">').append(
          $('<a>')
            .attr(
              'href',
              `https://live.staticflickr.com/${data.server}/${data.id}_${data.secret}_b.jpg`,
            )
            .append(
              $('<img>').attr(
                'src',
                `https://live.staticflickr.com/${data.server}/${data.id}_${data.secret}_m.jpg`,
              ),
            ),
          $('<p>').text(text),
          $("<div class='profile'>").append(
            $('<img>').attr(
              'src',
              `http://farm${data.farm}.staticflickr.com/${data.server}/buddyicons/${data.owner}.jpg`,
            ),
            $('<span>').text(data.owner),
          ),
        ),
      ),
    )
  })
}
//이미지 소스 로딩 완료시 레이아웃 적용 함수
function imgLoaded() {
  let imgNum = 0
  // 동적으로 완성된 img Dom 갯수만큼 반복을 돌면서 소스 이미지 에러가 나면 대체 이미지로 출력
  gallery.find(' li img').each(function (_, data) {
    data.onerror = function () {
      $(data).attr('src', 'https://www.flickr.com/images/buddyicon.gif')
    }
    data.onload = function () {
      imgNum++

      if (imgNum === num * 2) {
        //isotope layout  적용
        //gallery.selector 이게 뭔데
        new Isotope(gallery.selector + ' ul', {
          itemSelector: gallery.selector + ' li',
          columnWidth: gallery.selector + ' li',
          transitionDuration: '0.5s',
        })
        //gallery frame 보이게 처리하고 로딩바 숨김
        $(gallery.selector + ' ul').addClass('loaded')
        $('.loading').addClass('off')
      }
    }
  })
}

//검색기능 함수
function getTags() {
  let inputs = searchInput.val()
  //양 끝 공백제거
  inputs = inputs.trim()
  //검색어 없고 공백이면 alert
  if (!inputs || inputs === '') {
    alert('검색어를 입력하세요')
    return
  }

  //복수개의 검색어 입력시 콤마로 구분해서 문자열로 변환후 옵션객체에 전달
  //여러개의 문자열로 나눠요  배열
  inputs = inputs.split(' ')
  //배열의 모든 요소 연결 하나의 문자열?
  inputs = inputs.join(',')
  console.log(inputs)

  searchInput.val('')

  //input의 val가 search 됨
  getItems({
    method: search,
    tags: inputs,
  })
}
